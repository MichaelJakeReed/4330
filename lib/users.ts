import crypto from "crypto";

//type definition for what a "User" looks like in our app
type User = {
  id: string;
  username: string;
  passHash: string;
  spotify?: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  };
};

//in-memory user storage
const users = new Map<string, User>();

//hashPassword
export function hashPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

//createUser(username, password)
export function createUser(username: string, password: string) {
  const id = crypto.randomUUID();
  const passHash = hashPassword(password);
  const user: User = { id, username, passHash };
  users.set(id, user);
  return user;
}

//findByUsername(username)
export function findByUsername(username: string) {
  for (const u of users.values()) if (u.username === username) return u;
  return null;
}

//getUser(id)
export function getUser(id: string) {
  return users.get(id) ?? null;
}

//saveUser(user)
export function saveUser(u: User) {
  users.set(u.id, u);
}
