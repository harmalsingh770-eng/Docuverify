export const ADMIN_EMAIL = "gurnek1911@gmail.com";

export const isAdmin = (user) => {
  return user?.email === ADMIN_EMAIL;
};