import { Networked3dWebExperienceClient } from "@mml-io/3d-web-experience-client";

import hdrJpgUrl from "../../../assets/hdr/puresky_2k.jpg";
import airAnimationFileUrl from "../../../assets/models/anim_air.glb";
import doubleJumpAnimationFileUrl from "../../../assets/models/anim_double_jump.glb";
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
    doubleJumpAnimationFileUrl,
  },
  skyboxHdrJpgUrl: hdrJpgUrl,
  mmlDocuments: [
    {
      url: `${protocol}//${host}/mml-documents/simple-shaders.html`,
      position: {
        x: -30,
        y: 0,
        z: 10,
      },
    },
    {
      url: `${protocol}//${host}/mml-documents/complex-shaders.html`,
    },
    {
      url: `${protocol}//${host}/mml-documents/texture-shader-test.html`,
      position: {
        x: 30,
        y: 1,
        z: 0,
      },
    },
    {
      url: `${protocol}//${host}/mml-documents/transparent-shader-test.html`,
      position: {
        x: 45,
        y: 0,
        z: 0,
      },
    },
  ],
  environmentConfiguration: {},
  // avatarConfiguration: {
  //   availableAvatars: [],
  // },
});

app.update();
