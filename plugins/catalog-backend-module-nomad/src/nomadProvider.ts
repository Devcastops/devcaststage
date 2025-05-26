import { Entity } from '@backstage/catalog-model';
import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import {
  SchedulerServiceTaskRunner,
  UrlReaderService,
} from '@backstage/backend-plugin-api';

/**
 * Provides entities from fictional Nomad service.
 */
export class NomadProvider implements EntityProvider {
  private readonly env: string;
  private readonly reader: UrlReaderService;
  private connection?: EntityProviderConnection;
  private taskRunner: SchedulerServiceTaskRunner;

  /** [1] */
  constructor(
    env: string,
    reader: UrlReaderService,
    taskRunner: SchedulerServiceTaskRunner,
  ) {
    this.env = env;
    this.reader = reader;
    this.taskRunner = taskRunner;
  }

  /** [2] */
  getProviderName(): string {
    return `nomad-${this.env}`;
  }

  /** [3] */
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
    await this.taskRunner.run({
      id: this.getProviderName(),
      fn: async () => {
        await this.run();
      },
    });
  }

  /** [4] */
  async run(): Promise<void> {
    if (!this.connection) {
      throw new Error('Not initialized');
    }

    const response = await this.reader.readUrl(
      `https://Nomad-${this.env}.example.com/data`,
    );
    const data = JSON.parse((await response.buffer()).toString());

    /** [5] */
    const entities: Entity[] = []//NomadToEntities(data);

    /** [6] */
    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: `nomad-provider:${this.env}`,
      })),
    });
  }
}