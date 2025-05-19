import { RootConfigService } from '@backstage/backend-plugin-api';
import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { z } from 'zod'
const https = require('https')
/**
 * Creates an `acme:example` Scaffolder action.
 *
 * @remarks
 *
 * See {@link https://example.com} for more information.
 *
 * @public
 */
export const createNomadDispatch = (config: RootConfigService) => {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction({
    id: 'nomad:job:dispatch',
    description: 'Dispatch a nomad paramitirised job',
    schema: {
      input: z.object({
          job_name: z.string().describe("name of job to dispatch"),
          namespace: z.string().describe("namespace of job to dispatch"),
          params: z.object({
            instance_name: z.string().describe("name of instance to deploy"),
            node_pool: z.string().describe("nodepool to deploy the server in to"),
            instance_size: z.string().describe("size of the node pool"),
          })
      })
    },
    async handler(ctx) {
      var token = config.getString("scaffolder.nomad.token")
      var nomad_addr = config.getString("scaffolder.nomad.address")
      ctx.logger.info(
        `Despating: ${ctx.input.job_name}@${ctx.input.namespace}`,
      );

      let promise = new Promise((resolve, reject) => {
        const options: any = {
          hostname: nomad_addr,
          path: `/v1/job/${ctx.input.job_name}/dispatch?namespace=${ctx.input.namespace}`,
          method: 'POST',
          port: 4646,
          headers: {
            'x-nomad-token': token
          }
        }
  
        var req = https.request(options, (res: any) => {
          ctx.logger.info(
            `${res.statusCode}`,
          );
          res.on('data', (d: string) => {
            ctx.logger.info(
              `${d}`,
              resolve(res)
            );
          })
            res.on('error', function (e: any) {
            ctx.logger.info("Error : " + e.message);
            reject("error")
          });
        })
  
        req.on('error', function (e: any) {
          ctx.logger.info("Error : " + e.message);
          reject("error")
        });

        req.write(JSON.stringify
        ({
          // "Payload": "",
          Meta: {
            instance_name: ctx.input.params.instance_name,
            node_pool: ctx.input.params.node_pool,
            machine_type: ctx.input.params.instance_size
          }
        })
          
        );
        req.end();
      })

      await promise;
      
    },
  });
}
