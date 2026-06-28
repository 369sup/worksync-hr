# worksync-hr Copilot 指引

## 專案背景
- 技術棧：Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、Firebase。
- 架構：DDD + Hexagonal Architecture。
- 目標：建置 HR 差勤薪資系統，優先維持清楚邊界。

## 架構邊界
- `Domain` 只放 entity、value object、domain service、domain rule。
- `Application` 只做 use case orchestration、transaction boundary、port 協調。
- `Infrastructure` 才能實作 Firebase adapters、外部服務整合、資料 mapper。
- `UI` 使用 App Router、Server Actions、Route Handlers、shadcn/ui。

## 強制規則
- 不要在 `src/domain/**` 產生 React、Next.js、Firebase import。
- 不要在 `src/application/**` 直接呼叫 Firebase SDK。
- Firebase document 與 Domain entity 必須透過 mapper 轉換。
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。
- Firestore collection 命名使用小寫複數與底線，例如 `employees`、`attendance_records`。

## 命名與文件
- Use case 使用動詞開頭，例如 `SubmitLeaveRequest`。
- Repository port 以能力命名，例如 `AttendanceRecordRepository`。
- 文件變更時，同步更新 `docs/` 與 ADR。
