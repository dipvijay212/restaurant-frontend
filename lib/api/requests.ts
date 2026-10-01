import { initialRequestsData } from '../../mock/requests';
import { ServiceRequest, RequestStatus } from '../../types/notification';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

let requestsState: ServiceRequest[] = [...initialRequestsData];

type RequestListener = (requests: ServiceRequest[]) => void;

const listeners: Set<RequestListener> = new Set();

const notifyListeners = () => {
  const current = [...requestsState];
  listeners.forEach((cb) => cb(current));
};

export const requestsApi = {
  subscribe: (callback: RequestListener): (() => void) => {
    listeners.add(callback);
    callback([...requestsState]);
    return () => {
      listeners.delete(callback);
    };
  },

  getRequests: async (status?: RequestStatus): Promise<ServiceRequest[]> => {
    await delay();
    if (status) {
      return requestsState.filter(
        (r) => r.status.toUpperCase() === status.toUpperCase()
      );
    }
    return [...requestsState];
  },

  getTableRequests: async (tableId: string): Promise<ServiceRequest[]> => {
    await delay();
    return requestsState.filter((r) => r.tableId === tableId);
  },

  createRequest: async (
    reqData: Omit<ServiceRequest, 'id' | 'createdAt' | 'status'>
  ): Promise<ServiceRequest> => {
    await delay();

    // Check for active duplicate request
    const existingActive = requestsState.find(
      (r) =>
        r.tableId === reqData.tableId &&
        r.type === reqData.type &&
        ['PENDING', 'ACCEPTED', 'pending', 'in_progress'].includes(r.status)
    );

    if (existingActive) {
      throw new Error(`An active request for ${reqData.type.toUpperCase()} already exists.`);
    }

    const newReq: ServiceRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    requestsState.unshift(newReq);
    notifyListeners();

    // Simulate Staff Acceptance (after 4 seconds)
    setTimeout(() => {
      const idx = requestsState.findIndex((r) => r.id === newReq.id);
      if (idx !== -1 && (requestsState[idx].status === 'PENDING' || requestsState[idx].status === 'pending')) {
        requestsState[idx] = {
          ...requestsState[idx],
          status: 'ACCEPTED',
          assignedStaffName: 'Carlos Ruiz',
          updatedAt: new Date().toISOString(),
        };
        notifyListeners();

        // Simulate Staff Completion (after another 8 seconds)
        setTimeout(() => {
          const idx2 = requestsState.findIndex((r) => r.id === newReq.id);
          if (idx2 !== -1 && (requestsState[idx2].status === 'ACCEPTED' || requestsState[idx2].status === 'in_progress')) {
            requestsState[idx2] = {
              ...requestsState[idx2],
              status: 'COMPLETED',
              updatedAt: new Date().toISOString(),
            };
            notifyListeners();
          }
        }, 8000);
      }
    }, 4000);

    return newReq;
  },

  updateRequestStatus: async (
    id: string,
    status: RequestStatus,
    assignedStaffId?: string,
    assignedStaffName?: string
  ): Promise<ServiceRequest> => {
    await delay();
    const index = requestsState.findIndex((r) => r.id === id);
    if (index === -1) throw new Error('Request not found');

    const updated = {
      ...requestsState[index],
      status,
      assignedStaffId: assignedStaffId ?? requestsState[index].assignedStaffId,
      assignedStaffName: assignedStaffName ?? requestsState[index].assignedStaffName,
      updatedAt: new Date().toISOString(),
    };
    requestsState[index] = updated;
    notifyListeners();
    return updated;
  },

  cancelRequest: async (id: string): Promise<ServiceRequest> => {
    await delay();
    return requestsApi.updateRequestStatus(id, 'cancelled');
  },
};
