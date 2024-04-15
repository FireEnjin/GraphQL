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
  const user: any = await users.find("ImJf9C8QDhQJnOyV5HET", {
    friend: {
      _: {
        collectionPath: "users",
        whereEqual: {
          updatedBy: "~/users/iA7NkGkMV6PKVYaD67S8C1TlXoo1",
        },
        findOne: true,
      },
      users: {},
    },
  });

  console.log(user);

  expect(user).toBeTruthy();
});
