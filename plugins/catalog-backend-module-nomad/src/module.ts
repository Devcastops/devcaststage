import { coreServices, createBackendModule } from "@backstage/backend-plugin-api";
import { catalogProcessingExtensionPoint  } from '@backstage/plugin-catalog-node/alpha';
import { NomadProvider } from "./nomadProvider";

/**
 * A backend module that registers the action into the scaffolder
 */
export const catalogModule = createBackendModule({
  moduleId: 'nomad-provider',
  pluginId: 'catalog',
  register({ registerInit }) {
    registerInit({
      deps: {
        catalog: catalogProcessingExtensionPoint,
        reader: coreServices.urlReader,
        scheduler: coreServices.scheduler
      },
      async init({ catalog, reader, scheduler}) {
        const taskRunner = scheduler.createScheduledTaskRunner({
          frequency: { minutes: 30 },
          timeout: { minutes: 10 },
        });
        const nomad = new NomadProvider('dev', reader, taskRunner);
        catalog.addEntityProvider(nomad);
      }
    });
  },
})
