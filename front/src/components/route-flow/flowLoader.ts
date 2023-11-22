import { redirect } from "react-router-dom";
import { map } from "rxjs";
import { SpaceContentVersionQuery } from "../../appGraphql";
import { ContentVersion } from "../../gql/graphql";
import { client } from "../../state/urql";
import { pathToCurrentContent } from "../../static/routeConfigs";
import fromWonka from "../../utils/fromWonka";
import { CreateObservableFunction } from "../../utils/react-router-utils";

export type FlowLoaderData = {
  isCurrentUserOwner: boolean;
};

const flowLoader: CreateObservableFunction<FlowLoaderData> = (params) => {
  const spaceId = params.spaceId!;

  return fromWonka(
    client.query(
      SpaceContentVersionQuery,
      { spaceId },
      { requestPolicy: "network-only" }
    )
  ).pipe(
    map((result) => {
      if (result.error) {
        throw result.error;
      }

      if (!result.data?.space) {
        throw new Error("Not found");
      }

      const contentVersion = result?.data?.space?.space.contentVersion;

      if (contentVersion !== ContentVersion.V2) {
        return redirect(pathToCurrentContent(spaceId, contentVersion));
      }

      return { isCurrentUserOwner: !result.data.space.isReadOnly };
    })
  );
};

export default flowLoader;
