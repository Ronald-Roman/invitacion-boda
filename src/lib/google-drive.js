// Acceso a Google Drive desde el servidor (nunca importar desde componentes del navegador)

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const FILES_URL = "https://www.googleapis.com/drive/v3/files";
const UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id";
const TIPO_CARPETA = "application/vnd.google-apps.folder";
const NOMBRE_RAIZ = "Fotos Boda Angélica & Benjamin";

let token = null;
let tokenExpira = 0;
let raizId = process.env.GOOGLE_DRIVE_FOLDER_ID || null;

async function accessToken() {
  if (token && Date.now() < tokenExpira) return token;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Google rechazó el token: ${res.status} ${await res.text()}`);

  const data = await res.json();
  token = data.access_token;
  tokenExpira = Date.now() + (data.expires_in - 60) * 1000;
  return token;
}

async function drive(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${await accessToken()}`, ...options.headers },
  });
  if (!res.ok) throw new Error(`Google Drive respondió ${res.status}: ${await res.text()}`);
  return res;
}

function escapar(texto) {
  return texto.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

async function buscarCarpeta(condicion) {
  const params = new URLSearchParams({
    q: `mimeType='${TIPO_CARPETA}' and trashed=false and ${condicion}`,
    fields: "files(id)",
    pageSize: "1",
  });
  const { files } = await (await drive(`${FILES_URL}?${params}`)).json();
  return files[0]?.id ?? null;
}

async function crearCarpeta(nombre, appProperties, padre) {
  const res = await drive(`${FILES_URL}?fields=id`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nombre,
      mimeType: TIPO_CARPETA,
      appProperties,
      ...(padre && { parents: [padre] }),
    }),
  });
  return (await res.json()).id;
}

async function carpetaRaiz() {
  if (!raizId) {
    raizId =
      (await buscarCarpeta("appProperties has { key='rol' and value='raiz-boda' }")) ??
      (await crearCarpeta(NOMBRE_RAIZ, { rol: "raiz-boda" }));
  }
  return raizId;
}

async function buscarCarpetaInvitado(codigo) {
  const raiz = await carpetaRaiz();
  const id = await buscarCarpeta(`'${raiz}' in parents and appProperties has { key='codigo' and value='${escapar(codigo)}' }`);
  return { raiz, id };
}

// Una subcarpeta por invitado, identificada por su código (el nombre visible es el del invitado)
export async function carpetaInvitado(codigo, nombre) {
  const { raiz, id } = await buscarCarpetaInvitado(codigo);
  return id ?? (await crearCarpeta(nombre || codigo, { codigo }, raiz));
}

// Cuántas fotos y videos ha subido un invitado (para mostrarlo aunque recargue la página)
export async function contarArchivos(codigo) {
  const { id } = await buscarCarpetaInvitado(codigo);
  const cuenta = { fotos: 0, videos: 0 };
  if (!id) return cuenta;

  let pageToken;
  do {
    const params = new URLSearchParams({
      q: `'${id}' in parents and trashed=false`,
      fields: "nextPageToken, files(mimeType)",
      pageSize: "1000",
      ...(pageToken && { pageToken }),
    });
    const data = await (await drive(`${FILES_URL}?${params}`)).json();
    for (const f of data.files) {
      if (f.mimeType.startsWith("video/")) cuenta.videos++;
      else if (f.mimeType.startsWith("image/")) cuenta.fotos++;
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return cuenta;
}

// Crea una sesión de subida reanudable; el navegador sube el archivo directo a la URL devuelta
export async function crearSesionSubida({ carpeta, nombre, tipo, tamano, fecha, origin }) {
  const res = await drive(UPLOAD_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": tipo,
      "X-Upload-Content-Length": String(tamano),
      ...(origin && { Origin: origin }),
    },
    body: JSON.stringify({
      name: nombre,
      parents: [carpeta],
      ...(fecha && { modifiedTime: fecha }),
    }),
  });
  return res.headers.get("location");
}
