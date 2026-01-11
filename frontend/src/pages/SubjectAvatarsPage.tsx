// // // Conversational-Avatar/ProjectWithHeyGen/frontend/src/pages/SubjectAvatarsPage.tsx
// // import React, { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { useAuth } from "../auth/AuthContext";
// //
// // const API_URL = "http://localhost:8000";
// //
// // type AvatarSelection = { id: string; name: string; image_url?: string };
// // type VoiceSelection = { id: string; name: string };
// //
// // type AuthContextShape = {
// //   token: string | null;
// //   setAvatar: (a: AvatarSelection) => void;
// //   setVoice: (v: VoiceSelection) => void;
// // };
// //
// // type PresetKey = "mate" | "informatica" | "geografie" | "engleza";
// //
// // type Preset = {
// //   key: PresetKey;
// //   title: string;
// //   description: string;
// //
// //   avatarGroupId: string;
// //   avatarId: string;
// //   avatarName: string;
// //
// //   voiceId: string;
// //   voiceName: string;
// // };
// //
// // type HeygenGroupAvatarItem = {
// //   avatar_id: string;
// //   avatar_name?: string;
// //   preview_image_url?: string;
// // };
// //
// // type HeygenGroupResponse = {
// //   data?: {
// //     avatar_list?: HeygenGroupAvatarItem[];
// //     avatars?: HeygenGroupAvatarItem[];
// //   };
// // };
// //
// // const PRESETS: Preset[] = [
// //   {
// //     key: "informatica",
// //     title: "Informatica",
// //     description: "Întrebări pentru informatică.",
// //     avatarGroupId: "d08c85e6cff84d78b6dc41d83a2eccce",
// //     avatarId: "Brandon_Office_Sitting_Front_public",
// //     avatarName: "Brandon Office Sitting Front",
// //     voiceId: "3787b4ab93174952a3ad649209f1029a",
// //     voiceName: "Brandon",
// //   },
// //   {
// //     key: "geografie",
// //     title: "Geografie",
// //     description: "Întrebări pentru geografie.",
// //     avatarGroupId: "1727672614",
// //     avatarId: "Georgia_sitting_office_front",
// //     avatarName: "Georgia Sitting Office Front",
// //     voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
// //     voiceName: "Georgia",
// //   },
// //   {
// //     key: "mate",
// //     title: "Matematica",
// //     description: "Întrebări pentru mate.",
// //     avatarGroupId: "977b1ab85dba4eefb159a6072677effd",
// //     avatarId: "Caroline_Business_Sitting_Side_public",
// //     avatarName: "Caroline Business Sitting Side",
// //     voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
// //     voiceName: "Georgia",
// //   },
// //   {
// //     key: "engleza",
// //     title: "Engleza",
// //     description: "Întrebări pentru engleză.",
// //     avatarGroupId: "977b1ab85dba4eefb159a6072677effd",
// //     avatarId: "Caroline_Lobby_Standing_Side_public",
// //     avatarName: "Caroline Lobby Standing Side",
// //     voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
// //     voiceName: "Georgia",
// //   },
// // ];
// //
// // async function fetchAvatarPreviewFromGroup(params: {
// //   token: string;
// //   groupId: string;
// //   avatarId: string;
// // }): Promise<{ imageUrl: string; resolvedName: string } | null> {
// //   const res = await fetch(
// //     `${API_URL}/api/heygen/avatar-group/${params.groupId}/avatars`,
// //     {
// //       method: "GET",
// //       headers: {
// //         Accept: "application/json",
// //         Authorization: `Bearer ${params.token}`,
// //       },
// //     }
// //   );
// //
// //   if (!res.ok) {
// //     const text = await res.text().catch(() => "");
// //     console.error(
// //       `HeyGen avatar-group fetch failed: ${res.status} ${res.statusText} ${text}`.trim()
// //     );
// //     return null;
// //   }
// //
// //   const json = (await res.json()) as HeygenGroupResponse;
// //   const list = json.data?.avatar_list ?? json.data?.avatars ?? [];
// //   const found = list.find((a) => a.avatar_id === params.avatarId);
// //   if (!found) return null;
// //
// //   return {
// //     imageUrl: (found.preview_image_url ?? "").trim(),
// //     resolvedName: found.avatar_name ?? params.avatarId,
// //   };
// // }
// //
// // export function SubjectAvatarsPage() {
// //   const navigate = useNavigate();
// //   const { token, setAvatar, setVoice } = useAuth() as unknown as AuthContextShape;
// //
// //   const [previewByKey, setPreviewByKey] = useState<
// //     Record<string, { imageUrl: string; name: string }>
// //   >({});
// //   const [loading, setLoading] = useState(false);
// //
// //   const work = useMemo(
// //     () =>
// //       PRESETS.map((p) => ({
// //         key: p.key,
// //         groupId: p.avatarGroupId,
// //         avatarId: p.avatarId,
// //         fallbackName: p.avatarName,
// //       })),
// //     []
// //   );
// //
// //   useEffect(() => {
// //     if (!token) return;
// //
// //     let cancelled = false;
// //
// //     (async () => {
// //       setLoading(true);
// //       try {
// //         const entries = await Promise.all(
// //           work.map(async (w) => {
// //             const preview = await fetchAvatarPreviewFromGroup({
// //               token,
// //               groupId: w.groupId,
// //               avatarId: w.avatarId,
// //             });
// //
// //             return [
// //               w.key,
// //               {
// //                 imageUrl: preview?.imageUrl ?? "",
// //                 name: preview?.resolvedName ?? w.fallbackName,
// //               },
// //             ] as const;
// //           })
// //         );
// //
// //         if (cancelled) return;
// //         setPreviewByKey(Object.fromEntries(entries));
// //       } finally {
// //         if (!cancelled) setLoading(false);
// //       }
// //     })();
// //
// //     return () => {
// //       cancelled = true;
// //     };
// //   }, [token, work]);
// //
// //   if (!token) {
// //     navigate("/login");
// //     return null;
// //   }
// //
// //   function onPickPreset(p: Preset) {
// //     const preview = previewByKey[p.key];
// //
// //     setAvatar({
// //       id: p.avatarId,
// //       name: preview?.name ?? p.avatarName,
// //       image_url: preview?.imageUrl ?? "",
// //     });
// //     setVoice({ id: p.voiceId, name: p.voiceName });
// //     navigate("/chat");
// //   }
// //
// //   return (
// //     <div className="card" style={{ width: 960, marginTop: 20 }}>
// //       <div
// //         style={{
// //           display: "flex",
// //           justifyContent: "space-between",
// //           marginBottom: 16,
// //         }}
// //       >
// //         <div>
// //           <div style={{ fontSize: 20, fontWeight: 700 }}>
// //             Choose a subject avatar
// //           </div>
// //           <div style={{ fontSize: 12, color: "#9ca3af" }}>
// //             We load HeyGen preview images from the avatar group.
// //           </div>
// //         </div>
// //         <div style={{ fontSize: 12, color: "#9ca3af" }}>
// //           {loading ? "Loading previews..." : ""}
// //         </div>
// //       </div>
// //
// //       <div
// //         style={{
// //           display: "grid",
// //           gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
// //           gap: 12,
// //         }}
// //       >
// //         {PRESETS.map((p) => {
// //           const preview = previewByKey[p.key];
// //           const img = preview?.imageUrl;
// //
// //           return (
// //             <button
// //               key={p.key}
// //               onClick={() => onPickPreset(p)}
// //               style={{
// //                 display: "flex",
// //                 gap: 12,
// //                 padding: 12,
// //                 border: "1px solid #1f2937",
// //                 borderRadius: 12,
// //                 background: "#0b1220",
// //                 color: "#e5e7eb",
// //                 textAlign: "left",
// //                 cursor: "pointer",
// //               }}
// //             >
// //               <div
// //                 style={{
// //                   width: 120,
// //                   height: 120,
// //                   borderRadius: 10,
// //                   overflow: "hidden",
// //                   background: "#111827",
// //                   border: "1px solid #1f2937",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: "center",
// //                   flexShrink: 0,
// //                 }}
// //               >
// //                 {img ? (
// //                   <img
// //                     src={img}
// //                     alt={preview?.name ?? p.avatarName}
// //                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
// //                     loading="lazy"
// //                   />
// //                 ) : (
// //                   <div style={{ fontSize: 12, color: "#9ca3af" }}>
// //                     Loading...
// //                   </div>
// //                 )}
// //               </div>
// //
// //               <div style={{ flex: 1 }}>
// //                 <div style={{ fontSize: 16, fontWeight: 700 }}>{p.title}</div>
// //                 <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
// //                   {p.description}
// //                 </div>
// //
// //                 <div style={{ marginTop: 10, fontSize: 12, color: "#d1d5db" }}>
// //                   Avatar: {preview?.name ?? p.avatarName}
// //                 </div>
// //                 <div style={{ marginTop: 4, fontSize: 12, color: "#d1d5db" }}>
// //                   Voice: {p.voiceName}
// //                 </div>
// //               </div>
// //             </button>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // }
// //
// // export default SubjectAvatarsPage;
//
// // Conversational-Avatar/ProjectWithHeyGen/frontend/src/pages/SubjectAvatarsPage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../auth/AuthContext";
//
// const API_URL = "http://localhost:8000";
//
// type AvatarSelection = { id: string; name: string; image_url?: string };
// type VoiceSelection = { id: string; name: string };
//
// type AuthContextShape = {
//   token: string | null;
//   setAvatar: (a: AvatarSelection) => void;
//   setVoice: (v: VoiceSelection) => void;
// };
//
// type PresetKey = "mate" | "informatica" | "geografie" | "engleza";
//
// type Preset = {
//   key: PresetKey;
//   title: string;
//   description: string;
//
//   avatarGroupId: string;
//   avatarId: string;
//   avatarName: string;
//
//   voiceId: string;
//   voiceName: string;
// };
//
// type HeygenGroupAvatarItem = {
//   avatar_id: string;
//   avatar_name?: string;
//   preview_image_url?: string;
// };
//
// type HeygenGroupResponse = {
//   data?: {
//     avatar_list?: HeygenGroupAvatarItem[];
//     avatars?: HeygenGroupAvatarItem[];
//   };
// };
//
// const PRESETS: Preset[] = [
//   {
//     key: "informatica",
//     title: "Informatica",
//     description: "Întrebări pentru informatică.",
//     avatarGroupId: "d08c85e6cff84d78b6dc41d83a2eccce",
//     avatarId: "Brandon_Office_Sitting_Front_public",
//     avatarName: "Brandon Office Sitting Front",
//     voiceId: "3787b4ab93174952a3ad649209f1029a",
//     voiceName: "Brandon",
//   },
//   {
//     key: "geografie",
//     title: "Geografie",
//     description: "Întrebări pentru geografie.",
//     avatarGroupId: "1727672614",
//     avatarId: "Georgia_sitting_office_front",
//     avatarName: "Georgia Sitting Office Front",
//     voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
//     voiceName: "Georgia",
//   },
//   {
//     key: "mate",
//     title: "Matematica",
//     description: "Întrebări pentru mate.",
//     avatarGroupId: "977b1ab85dba4eefb159a6072677effd",
//     avatarId: "Caroline_Business_Sitting_Side_public",
//     avatarName: "Caroline Business Sitting Side",
//     voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
//     voiceName: "Georgia",
//   },
//   {
//     key: "engleza",
//     title: "Engleza",
//     description: "Întrebări pentru engleză.",
//     avatarGroupId: "977b1ab85dba4eefb159a6072677effd",
//     avatarId: "Caroline_Lobby_Standing_Side_public",
//     avatarName: "Caroline Lobby Standing Side",
//     voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
//     voiceName: "Georgia",
//   },
// ];
//
// async function fetchAvatarPreviewFromGroup(params: {
//   token: string;
//   groupId: string;
//   avatarId: string;
// }): Promise<{ imageUrl: string; resolvedName: string } | null> {
//   const res = await fetch(
//     `${API_URL}/api/heygen/avatar-group/${params.groupId}/avatars`,
//     {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         Authorization: `Bearer ${params.token}`,
//       },
//     }
//   );
//
//   if (!res.ok) {
//     const text = await res.text().catch(() => "");
//     console.error(
//       `HeyGen avatar-group fetch failed: ${res.status} ${res.statusText} ${text}`.trim()
//     );
//     return null;
//   }
//
//   const json = (await res.json()) as HeygenGroupResponse;
//   const list = json.data?.avatar_list ?? json.data?.avatars ?? [];
//   const found = list.find((a) => a.avatar_id === params.avatarId);
//   if (!found) return null;
//
//   return {
//     imageUrl: (found.preview_image_url ?? "").trim(),
//     resolvedName: found.avatar_name ?? params.avatarId,
//   };
// }
//
// export function SubjectAvatarsPage() {
//   const navigate = useNavigate();
//   const { token, setAvatar, setVoice } = useAuth() as unknown as AuthContextShape;
//
//   const [previewByKey, setPreviewByKey] = useState<
//     Record<string, { imageUrl: string; name: string }>
//   >({});
//   const [loading, setLoading] = useState(false);
//
//   const work = useMemo(
//     () =>
//       PRESETS.map((p) => ({
//         key: p.key,
//         groupId: p.avatarGroupId,
//         avatarId: p.avatarId,
//         fallbackName: p.avatarName,
//       })),
//     []
//   );
//
//   useEffect(() => {
//     if (!token) return;
//
//     let cancelled = false;
//
//     (async () => {
//       setLoading(true);
//       try {
//         const entries = await Promise.all(
//           work.map(async (w) => {
//             const preview = await fetchAvatarPreviewFromGroup({
//               token,
//               groupId: w.groupId,
//               avatarId: w.avatarId,
//             });
//
//             return [
//               w.key,
//               {
//                 imageUrl: preview?.imageUrl ?? "",
//                 name: preview?.resolvedName ?? w.fallbackName,
//               },
//             ] as const;
//           })
//         );
//
//         if (cancelled) return;
//         setPreviewByKey(Object.fromEntries(entries));
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//
//     return () => {
//       cancelled = true;
//     };
//   }, [token, work]);
//
//   if (!token) {
//     navigate("/login");
//     return null;
//   }
//
//   function onPickPreset(p: Preset) {
//     const preview = previewByKey[p.key];
//
//     setAvatar({
//       id: p.avatarId,
//       name: preview?.name ?? p.avatarName,
//       image_url: preview?.imageUrl ?? "",
//     });
//     setVoice({ id: p.voiceId, name: p.voiceName });
//     navigate("/chat");
//   }
//
//   function onCustomise() {
//     navigate("/avatars");
//   }
//
//   const cardStyle: React.CSSProperties = {
//     width: 260,
//     minWidth: 260,
//     display: "flex",
//     flexDirection: "column",
//     gap: 10,
//     padding: 12,
//     border: "1px solid #1f2937",
//     borderRadius: 12,
//     background: "#0b1220",
//     color: "#e5e7eb",
//     textAlign: "left",
//     cursor: "pointer",
//   };
//
//   return (
//     <div className="card" style={{ width: 960, marginTop: 20 }}>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           marginBottom: 16,
//           alignItems: "center",
//         }}
//       >
//         <div>
//           <div style={{ fontSize: 20, fontWeight: 700 }}>Choose a subject avatar</div>
//           <div style={{ fontSize: 12, color: "#9ca3af" }}>
//             {loading ? "Loading previews..." : "Pick a preset or customize."}
//           </div>
//         </div>
//         <div style={{ fontSize: 12, color: "#9ca3af" }}>Step 1</div>
//       </div>
//
//       <div
//         style={{
//           display: "flex",
//           gap: 12,
//           overflowX: "auto",
//           paddingBottom: 8,
//         }}
//       >
//         {PRESETS.map((p) => {
//           const preview = previewByKey[p.key];
//           const img = preview?.imageUrl;
//
//           return (
//             <button key={p.key} onClick={() => onPickPreset(p)} style={cardStyle}>
//               <div
//                 style={{
//                   width: "100%",
//                   height: 150,
//                   borderRadius: 10,
//                   overflow: "hidden",
//                   background: "#111827",
//                   border: "1px solid #1f2937",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 {img ? (
//                   <img
//                     src={img}
//                     alt={preview?.name ?? p.avatarName}
//                     style={{ width: "100%", height: "100%", objectFit: "cover" }}
//                     loading="lazy"
//                   />
//                 ) : (
//                   <div style={{ fontSize: 12, color: "#9ca3af" }}>
//                     {loading ? "Loading..." : "No preview"}
//                   </div>
//                 )}
//               </div>
//
//               <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
//                 <div style={{ fontSize: 16, fontWeight: 700 }}>{p.title}</div>
//                 <div style={{ fontSize: 12, color: "#9ca3af" }}>{p.description}</div>
//                 <div style={{ marginTop: 6, fontSize: 12, color: "#d1d5db" }}>
//                   Avatar: {preview?.name ?? p.avatarName}
//                 </div>
//                 <div style={{ fontSize: 12, color: "#d1d5db" }}>Voice: {p.voiceName}</div>
//               </div>
//             </button>
//           );
//         })}
//
//         <button
//           onClick={onCustomise}
//           style={{
//             ...cardStyle,
//             border: "1px dashed #374151",
//             background: "transparent",
//             justifyContent: "center",
//             alignItems: "center",
//             textAlign: "center",
//           }}
//         >
//           <div
//             style={{
//               width: "100%",
//               height: 150,
//               borderRadius: 10,
//               border: "1px dashed #374151",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               fontSize: 12,
//               color: "#9ca3af",
//             }}
//           >
//             Customize
//           </div>
//
//           <div style={{ fontSize: 16, fontWeight: 700 }}>Custom selection</div>
//           <div style={{ fontSize: 12, color: "#9ca3af" }}>
//             Open `AvatarSelectionPage` to pick any avatar/voice.
//           </div>
//         </button>
//       </div>
//     </div>
//   );
// }
//
// export default SubjectAvatarsPage;


// Conversational-Avatar/ProjectWithHeyGen/frontend/src/pages/SubjectAvatarsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

type AvatarSelection = { id: string; name: string; image_url?: string };
type VoiceSelection = { id: string; name: string };

type AuthContextShape = {
  token: string | null;
  setAvatar: (a: AvatarSelection) => void;
  setVoice: (v: VoiceSelection) => void;
};

type PresetKey = "mate" | "informatica" | "geografie" | "engleza";

type Preset = {
  key: PresetKey;
  title: string;
  description: string;
  longDescription: string;

  avatarGroupId: string;
  avatarId: string;
  avatarName: string;

  voiceId: string;
  voiceName: string;
};

type HeygenGroupAvatarItem = {
  avatar_id: string;
  avatar_name?: string;
  preview_image_url?: string;
};

type HeygenGroupResponse = {
  data?: {
    avatar_list?: HeygenGroupAvatarItem[];
    avatars?: HeygenGroupAvatarItem[];
  };
};

const PRESETS: Preset[] = [
  {
    key: "informatica",
    title: "Informatica",
    description: "Întrebări pentru informatică.",
    longDescription: "Algoritmi, structuri de date, OOP și concepte de bază pentru examene.",
    avatarGroupId: "d08c85e6cff84d78b6dc41d83a2eccce",
    avatarId: "Brandon_Office_Sitting_Front_public",
    avatarName: "Brandon Office Sitting Front",
    voiceId: "3787b4ab93174952a3ad649209f1029a",
    voiceName: "Brandon",
  },
  {
    key: "geografie",
    title: "Geografie",
    description: "Întrebări pentru geografie.",
    longDescription: "Hărți, capitale, forme de relief și noțiuni esențiale pentru recapitulare.",
    avatarGroupId: "1727672614",
    avatarId: "Georgia_sitting_office_front",
    avatarName: "Georgia Sitting Office Front",
    voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
    voiceName: "Georgia",
  },
  {
    key: "mate",
    title: "Matematica",
    description: "Întrebări pentru mate.",
    longDescription: "Exerciții ghidate: algebră, funcții, trigonometrie și probleme tip.",
    avatarGroupId: "977b1ab85dba4eefb159a6072677effd",
    avatarId: "Caroline_Business_Sitting_Side_public",
    avatarName: "Caroline Business Sitting Side",
    voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
    voiceName: "Georgia",
  },
  {
    key: "engleza",
    title: "Engleza",
    description: "Întrebări pentru engleză.",
    longDescription: "Conversație, vocabular, gramatică și simulări de dialog pentru practică.",
    avatarGroupId: "977b1ab85dba4eefb159a6072677effd",
    avatarId: "Caroline_Lobby_Standing_Side_public",
    avatarName: "Caroline Lobby Standing Side",
    voiceId: "da6a3889803f4ef29db3b9cdd7ec7135",
    voiceName: "Georgia",
  },
];

async function fetchAvatarPreviewFromGroup(params: {
  token: string;
  groupId: string;
  avatarId: string;
}): Promise<{ imageUrl: string; resolvedName: string } | null> {
  const res = await fetch(
    `${API_URL}/api/heygen/avatar-group/${params.groupId}/avatars`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${params.token}`,
      },
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `HeyGen avatar-group fetch failed: ${res.status} ${res.statusText} ${text}`.trim()
    );
    return null;
  }

  const json = (await res.json()) as HeygenGroupResponse;
  const list = json.data?.avatar_list ?? json.data?.avatars ?? [];
  const found = list.find((a) => a.avatar_id === params.avatarId);
  if (!found) return null;

  return {
    imageUrl: (found.preview_image_url ?? "").trim(),
    resolvedName: found.avatar_name ?? params.avatarId,
  };
}

export function SubjectAvatarsPage() {
  const navigate = useNavigate();
  const { token, setAvatar, setVoice } = useAuth() as unknown as AuthContextShape;

  const [previewByKey, setPreviewByKey] = useState<
    Record<string, { imageUrl: string; name: string }>
  >({});
  const [loading, setLoading] = useState(false);

  const work = useMemo(
    () =>
      PRESETS.map((p) => ({
        key: p.key,
        groupId: p.avatarGroupId,
        avatarId: p.avatarId,
        fallbackName: p.avatarName,
      })),
    []
  );

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(
          work.map(async (w) => {
            const preview = await fetchAvatarPreviewFromGroup({
              token,
              groupId: w.groupId,
              avatarId: w.avatarId,
            });

            return [
              w.key,
              {
                imageUrl: preview?.imageUrl ?? "",
                name: preview?.resolvedName ?? w.fallbackName,
              },
            ] as const;
          })
        );

        if (cancelled) return;
        setPreviewByKey(Object.fromEntries(entries));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, work]);

  if (!token) {
    navigate("/login");
    return null;
  }

  function onPickPreset(p: Preset) {
    const preview = previewByKey[p.key];

    setAvatar({
      id: p.avatarId,
      name: preview?.name ?? p.avatarName,
      image_url: preview?.imageUrl ?? "",
    });
    setVoice({ id: p.voiceId, name: p.voiceName });
    navigate("/chat");
  }

  function onCustomise() {
    navigate("/avatars");
  }

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    padding: 14,
    border: "1px solid #1f2937",
    borderRadius: 14,
    background: "#0b1220",
    color: "#e5e7eb",
    textAlign: "left",
    cursor: "pointer",
    minHeight: 430,
    transition: "transform 120ms ease, border-color 120ms ease",
  };

  const titleStyle: React.CSSProperties = { fontSize: 16, fontWeight: 800 };
  const smallMuted: React.CSSProperties = { fontSize: 12, color: "#9ca3af" };

  return (
    <div className="card" style={{ width: 960, marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
          alignItems: "center",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Choose a subject avatar</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>
            {loading ? "Loading previews..." : "Pick a preset or customize."}
          </div>
        </div>
        {/*<div style={{ fontSize: 12, color: "#9ca3af" }}>Step 1 / 3</div>*/}
                  <button className="button-secondary" onClick={() => navigate("/mode")}>
          Back
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12,
        }}
      >
        {PRESETS.map((p) => {
          const preview = previewByKey[p.key];
          const img = preview?.imageUrl;

          return (
            <button
              key={p.key}
              onClick={() => onPickPreset(p)}
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = "#374151";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0px)";
                e.currentTarget.style.borderColor = "#1f2937";
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 210,
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#111827",
                  border: "1px solid #1f2937",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {img ? (
                  <img
                    src={img}
                    alt={preview?.name ?? p.avatarName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    loading="lazy"
                  />
                ) : (
                  <div style={smallMuted}>{loading ? "Loading..." : "No preview"}</div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={titleStyle}>{p.title}</div>
                <div style={smallMuted}>{p.description}</div>
                <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.35 }}>
                  {p.longDescription}
                </div>

                <div style={{ marginTop: 10, fontSize: 12, color: "#d1d5db" }}>
                  Avatar: {preview?.name ?? p.avatarName}
                </div>
                <div style={{ fontSize: 12, color: "#d1d5db" }}>Voice: {p.voiceName}</div>
              </div>
            </button>
          );
        })}

        <button
          onClick={onCustomise}
          style={{
            ...cardStyle,
            border: "1px dashed #374151",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "#64748b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.borderColor = "#374151";
          }}
        >
          <div
            style={{
              width: "100%",
              height: 210,
              borderRadius: 12,
              border: "1px dashed #374151",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(180deg, rgba(17,24,39,0.2), rgba(11,18,32,0.2))",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 13, color: "#9ca3af" }}>Customize</div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                Choose any avatar/voice
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={titleStyle}>Custom selection</div>
            <div style={smallMuted}>
              Open `AvatarSelectionPage` to pick any avatar/voice.
            </div>
            <div style={{ fontSize: 12, color: "#cbd5e1", lineHeight: 1.35 }}>
              Select a different character, voice, and style to match your lesson.
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "#d1d5db" }}>
              Avatar: Any
            </div>
            <div style={{ fontSize: 12, color: "#d1d5db" }}>Voice: Any</div>
          </div>
        </button>

      </div>
    </div>
  );
}

export default SubjectAvatarsPage;
