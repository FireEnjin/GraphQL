import Model from "./src/Model";
import { Collection } from "fireorm";
import connectFirestore from "./src/helpers/connectFirestore";

test("Should test model", async () => {
  const db = connectFirestore({
    serviceAccount: true,
  });

  @Collection("users")
  class User {
    id: string;
    email?: string;
  }

  class UserModel extends Model<User> {
    constructor() {
      super({
        docSchema: User,
      });
    }
  }

  const users = new UserModel();
  const user = await users.find("test", {
    createdBy: {},
  });

  console.log(user);

  expect(user).toBeTruthy();
});
