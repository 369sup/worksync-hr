# Env Vars

## 目的
- 定義 `.env.local` 範例欄位與 server/client 邊界。

## `.env.local` 範例
```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your-public-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:example

FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@example.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nREDACTED\n-----END PRIVATE KEY-----\n"

FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

## 分類規則
| 類型 | 說明 |
| --- | --- |
| `NEXT_PUBLIC_*` | 只放 public Firebase config |
| server-only | admin credentials、session secret、internal policy config |
| emulator | 僅用於本地 / 測試，不進 production |

## 規則
- 不要提交真實 secret。
- 缺少必要 server env 時要 fail fast。
- 權限真相、薪資匯出、audit 控制值不可暴露到 client。
