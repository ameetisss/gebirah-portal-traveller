import { createContext, useContext, useState } from "react";
import {
  createPlaceholderRequesterRequest,
  placeholderRequesterRequests,
} from "../data/requesterData";

const RequestContext = createContext();

export function RequestProvider({ children }) {
  const [requests, setRequests] = useState(placeholderRequesterRequests);

  function addRequest(form, requesterName) {
    setRequests((current) => [createPlaceholderRequesterRequest(form, requesterName), ...current]);
  }

  function updateRequestStatus(requestId, statusKey) {
    setRequests((current) => current.map((request) => (
      request.id === requestId ? { ...request, statusKey } : request
    )));
  }

  function updateRequest(requestId, patch) {
    setRequests((current) => current.map((request) => (
      request.id === requestId ? { ...request, ...patch } : request
    )));
  }

  return (
    <RequestContext.Provider value={{ requests, addRequest, updateRequestStatus, updateRequest }}>
      {children}
    </RequestContext.Provider>
  );
}

export function useRequests() {
  return useContext(RequestContext);
}
