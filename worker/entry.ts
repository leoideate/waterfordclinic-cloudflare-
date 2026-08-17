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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Single-instance app (no horizontal scaling need for a walk-in
    // clinic's traffic) - a FIXED id here, not e.g. url.pathname, is
    // deliberate: every request must land on the same container instance,
    // not get sharded across a different one per path.
    const container = getContainer(env.CLINIC_CONTAINER, 'primary');
    return await container.fetch(request);
  },
};
