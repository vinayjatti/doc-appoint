export const isSessionValid = (): boolean => {
  const loginTime = localStorage.getItem("loginTime");
  const sessionDuration = localStorage.getItem("sessionDuration");

  if (!loginTime || !sessionDuration) return false;

  const now = new Date().getTime();
  const expiryTime = parseInt(loginTime) + parseInt(sessionDuration);

  return now < expiryTime;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("doctorId");
  localStorage.removeItem("doctorName");
  localStorage.removeItem("loginTime");
  localStorage.removeItem("sessionDuration");
};