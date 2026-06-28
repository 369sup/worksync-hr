# Prompt Patterns

## 目的
- 提供符合 DDD + Hexagonal + Security 邊界的提示模板。

## 安全提示詞
| 目的 | 提示模板 |
| --- | --- |
| DDD 實作 | `請先確認 bounded context、aggregate、ports，再提出最小變更。` |
| Firebase 實作 | `Firebase SDK 只能放在 infrastructure / server-side adapter，請不要把 document shape 帶進 Domain。` |
| Frontend 調整 | `請區分 page、slot、use case、bounded context；敏感寫入只能走 server-side use case。` |
| 文件同步 | `若邊界、schema、rules、roles 有變動，請同步更新對應 canonical doc。` |

## 好提示結構
1. 指定 bounded context。
2. 指定 layer。
3. 指定 sensitive data 限制。
4. 指定需同步的 docs。

## 範例
- `請在 Leave context 的 Application layer 規劃 SubmitLeaveRequest，先列出需要的 ports，勿直接依賴 Firebase。`
- `請調整 payroll 頁面 layout，但不要把 page / slot 當成 use case 或 bounded context。`
