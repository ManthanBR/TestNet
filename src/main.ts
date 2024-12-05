import { 
  bootstrapCameraKit,
  CameraKitSession,
  createMediaStreamSource,
  Transform2D,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas') as HTMLCanvasElement;
const flipCamera = document.getElementById('flip') as HTMLElement | null;

let isBackFacing = true;
let mediaStream: MediaStream;

async function init() {
  const cameraKit = await bootstrapCameraKit({
    apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzI2NTY1MzEwLCJzdWIiOiIyN2NmNDQwYy04YjBkLTQ5ZDEtYTM2MC04YjdkODQ5OTM3ZWJ-U1RBR0lOR340Y2ZhYTJiOC1kYWY4LTRhZDYtODYwNy1iMmI5NWYzMDVmMzAifQ.q8qMDDOzMv4jFiZ8NRqQ8-qDJMV4l5YmOex67WC6DqI',
  });

  const session = await cameraKit.createSession({ liveRenderTarget });
  const lens = await cameraKit.lensRepository.loadLens(
    '6c424c08-be3b-45e5-9f22-98a3d503bcd8',
    '276ddfa1-5fbe-4099-aaaf-ceb9c81bb17f'
  );

  session.applyLens(lens);

  bindFlipCamera(session);
}

function bindFlipCamera(session: CameraKitSession) {
  // Null check to ensure flipCamera exists before accessing it
  if (!flipCamera) {
    console.error('Flip Camera button not found');
    return;
  }

  flipCamera.style.cursor = 'pointer';

  flipCamera.addEventListener('click', () => {
    updateCamera(session);
  });

  updateCamera(session);
}

async function updateCamera(session: CameraKitSession) {
  isBackFacing = !isBackFacing;

  // Update the button text based on the camera
  if (flipCamera) {
    flipCamera.innerText = isBackFacing
      ? 'Switch to Front Camera'
      : 'Switch to Back Camera';
  }

  if (mediaStream) {
    session.pause();
    mediaStream.getVideoTracks()[0].stop();
  }

  // Request media stream with appropriate facingMode for front or back camera
  mediaStream = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: isBackFacing ? 'environment' : 'user',
    },
  });

  const source = createMediaStreamSource(mediaStream, {
    // Set cameraType to "environment" or "user" instead of "back" or "front"
    cameraType: isBackFacing ? 'environment' : 'user',
  });

  await session.setSource(source);

  // Mirror the video feed if using the front camera
  if (!isBackFacing) {
    source.setTransform(Transform2D.MirrorX);
  }

  session.play();
}

init();
