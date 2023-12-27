import { SpaceEntity } from 'dynamodb-models/space';
import { FlowConfigSchema } from 'flow-models';
import invariant from 'tiny-invariant';

(async () => {
  let total = 0;

  let response = await SpaceEntity.scan({ limit: 25 });

  while_loop: while (true) {
    invariant(
      response.Count != null && response.Items != null,
      'response.Count and response.Items should not be null',
    );

    console.log(`Processing item ${total} to ${total + response.Count}`);

    total += response.Count;

    for (const item of response.Items) {
      const flowConfig = JSON.parse(item.contentV3);

      const { error, value } = FlowConfigSchema.validate(flowConfig, {
        stripUnknown: true,
      });

      if (error != null) {
        console.log('Error contentV3:', JSON.stringify(value, null, 2));
        console.log('Error item ID:', item.id, 'Error message:', error.message);
        break while_loop;
      }
    }

    if (response.Count < 10 || response.next == null) {
      break;
    }

    response = await response.next();
  }

  console.log(`Finished, processed ${total} items in total`);
})();
