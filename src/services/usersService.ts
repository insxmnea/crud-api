import { v4 as uuidv4 } from "uuid";
import { User, UserWithoutId } from "../types/user";

class UsersService {
  private users: Map<string, User> = new Map();

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(userData: UserWithoutId): User {
    const id = uuidv4();
    const newUser: User = { id, ...userData };
    this.users.set(id, newUser);
    return newUser;
  }

  updateUser(id: string, userData: UserWithoutId): User | undefined {
    if (!this.users.has(id)) {
      return undefined;
    }

    const updatedUser: User = { id, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
}

export default new UsersService();
