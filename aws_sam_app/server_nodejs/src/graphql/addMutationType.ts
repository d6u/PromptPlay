import { BuilderType } from "./graphql-types.js";

export default function addMutationType(builder: BuilderType) {
  // builder.mutationType({
  //   fields(t) {
  //     return {
  //       createPlaceholderUserAndExampleSpace: t.field({
  //         type: "CreatePlaceholderUserAndExampleSpaceResult",
  //         async resolve(parent, args, context) {
  //           let dbUser: OrmUser;

  //           if (!context.req.user?.idToken) {
  //             const placeholderClientToken = asUUID(uuidv4());
  //             dbUser = new OrmUser({
  //               name: null,
  //               email: null,
  //               profilePictureUrl: null,
  //               auth0UserId: null,
  //               isUserPlaceholder: true,
  //               placeholderClientToken: placeholderClientToken,
  //             });
  //             await dbUser.save();
  //           } else {
  //           }
  //         },
  //       }),
  //     };
  //   },
  // });

  builder.objectType("CreatePlaceholderUserAndExampleSpaceResult", {
    fields(t) {
      return {
        placeholderClientToken: t.string({
          async resolve(parent, args, context) {
            return "";
          },
        }),
        space: t.field({
          type: "Space",
          nullable: true,
          async resolve(parent, args, context) {
            return null;
          },
        }),
      };
    },
  });
}
