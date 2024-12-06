import {
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const flipCamera = document.getElementById('flip') as HTMLButtonElement; // Use the correct type

let isBackFacing = true;
let mediaStream: MediaStream;

async function init() {
  const cameraKit = await bootstrapCameraKit({
    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzI2NTY1MzEwLCJzdWIiOiIyN2NmNDQwYy04YjBkLTQ5ZDEtYTM2MC04YjdkODQ5OTM3ZWJ-U1RBR0lOR340Y2ZhYTJiOC1kYWY4LTRhZDYtODYwNy1iMmI5NWYzMDVmMzAifQ.q8qMDDOzMv4jFiZ8NRqQ8-qDJMV4l5YmOex67WC6DqI',
  });

  const session = await cameraKit.createSession({ liveRenderTarget });
  const { lenses } = await cameraKit.lensRepository.loadLensGroups([
    '276ddfa1-5fbe-4099-aaaf-ceb9c81bb17f',
  ]);

  session.applyLens(lenses[0]);

  bindFlipCamera(session);
}

function bindFlipCamera(session: CameraKitSession) {
  if (flipCamera) {  // Check if flipCamera is not null
    flipCamera.style.cursor = 'pointer';

    flipCamera.addEventListener('click', () => {
      updateCamera(session);
    });
  }

  updateCamera(session);
}

async function updateCamera(session: CameraKitSession) {
  isBackFacing = !isBackFacing;

  if (flipCamera) {
    flipCamera.innerText = isBackFacing
      ? 'Switch to Front Camera'
      : 'Switch to Back Camera';
  }

  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: isBackFacing ? 'environment' : 'user',
    },
  });

  const source = createMediaStreamSource(mediaStream, {
    cameraType: isBackFacing ? 'environment' : 'user',  // Corrected camera type
  });

  await session.setSource(source);

  if (!isBackFacing) {
    source.setTransform(Transform2D.MirrorX);
  }

  session.play();
}

init();
