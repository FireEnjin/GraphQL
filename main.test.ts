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
  const user: any = await users.find("test", {
    createdBy: {
      createdBy: {
        users: {
          createdBy: {
            users: {
              createdBy: {},
            },
          },
        },
      },
    },
  });

  console.log(user);
  console.log(user.createdBy);
  for (const createdUser of user.createdBy.createdBy.users) {
    console.log("deep users", createdUser?.createdBy?.users);
  }

  expect(user).toBeTruthy();
});
