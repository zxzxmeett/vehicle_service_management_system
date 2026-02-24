const calculateTimes = (statusHistory) => {
  let serviceTime = 0;
  let idleTime = 0;

  const ACTIVE_SERVICE_STATUSES = new Set([
    "IN_SERVICE",
    "QC_PENDING",
    "IN_REWORK",
    "REWORK_QC_PENDING",
  ]);

  for (let i = 0; i < statusHistory.length - 1; i++) {
    const current = statusHistory[i];
    const next = statusHistory[i + 1];

    const diff = new Date(next.changedAt) - new Date(current.changedAt);

    if (ACTIVE_SERVICE_STATUSES.has(current.status)) {
      serviceTime += diff;
    } else {
      idleTime += diff;
    }
  }

  return {
    serviceTimeInMinutes: Math.floor(serviceTime / 60000),
    idleTimeInMinutes: Math.floor(idleTime / 60000),
  };
};

module.exports = { calculateTimes };
