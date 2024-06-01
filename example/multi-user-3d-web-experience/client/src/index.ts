import { Networked3dWebExperienceClient } from "@mml-io/3d-web-experience-client";

import hdrJpgUrl from "../../../assets/hdr/puresky_2k.jpg";
import airAnimationFileUrl from "../../../assets/models/anim_air.glb";
import idleAnimationFileUrl from "../../../assets/models/anim_idle.glb";
import jogAnimationFileUrl from "../../../assets/models/anim_jog.glb";
import sprintAnimationFileUrl from "../../../assets/models/anim_run.glb";

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const host = window.location.host;
const userNetworkAddress = `${protocol}//${host}/network`;
const chatNetworkAddress = `${protocol}//${host}/chat-network`;

const holder = Networked3dWebExperienceClient.createFullscreenHolder();
const app = new Networked3dWebExperienceClient(holder, {
  sessionToken: (window as any).SESSION_TOKEN,
  userNetworkAddress,
  chatNetworkAddress,
  animationConfig: {
    airAnimationFileUrl,
    idleAnimationFileUrl,
    jogAnimationFileUrl,
    sprintAnimationFileUrl,
  },
  hdrJpgUrl,
  mmlDocuments: [
    // { url: `${protocol}//${host}/mml-documents/example-mml.html` },
    // {
    //   url: `${protocol}//${host}/mml-documents/instance-test.html`,
    //   position: { x: 2, y: 0, z: 0 },
    // },
    {
      url: `${protocol}//${host}/mml-documents/instances-2-test.html`,
      position: { x: -10, y: 0, z: 0 },
    },
  ],
});
app.update();
