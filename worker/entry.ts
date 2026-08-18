import { Container, getContainer } from '@cloudflare/containers';

export class WaterfordClinicContainer extends Container {
  // Matches the Dockerfile's EXPOSE 80 / SERVER_NAME=:80.
  defaultPort = 80;

  // Long on purpose - a dedicated keep-alive Worker (see
  // cloudflare/keepalive/) pings /up every 5 minutes to prevent this
  // from ever actually being reached under normal operation. There is no
  // "min instances" feature on this platform; this plus the keep-alive
  // Cron Trigger is the real mitigation for cold starts, which is the
  // reliability class of bug this migration exists to get away from.
  sleepAfter = '24h';
}

interface Env {
  CLINIC_CONTAINER: DurableObjectNamespace<WaterfordClinicContainer>;
  APP_KEY: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Single-instance app (no horizontal scaling need for a walk-in
    // clinic's traffic) - a FIXED id here, not e.g. url.pathname, is
    // deliberate: every request must land on the same container instance,
    // not get sharded across a different one per path.
    const container = getContainer(env.CLINIC_CONTAINER, 'primary');

    // Worker secrets/vars (this `env` object) are NOT automatically
    // forwarded to the container process - they only reach it if passed
    // explicitly here, and only take effect when the container actually
    // starts (a no-op on an already-running instance).
    await container.startAndWaitForPorts({
      startOptions: {
        envVars: {
          APP_KEY: env.APP_KEY,
          APP_ENV: 'production',
          APP_DEBUG: 'false',
          APP_URL: 'https://waterfordclinic-cloudflare.yesideate.workers.dev',
          SANCTUM_STATEFUL_DOMAINS: 'waterfordclinic-cloudflare.yesideate.workers.dev',
          LOG_CHANNEL: 'stderr',
        },
      },
    });

    return await container.fetch(request);
  },
};
