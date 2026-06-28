# ADR Index

## ADR 清單
| ADR | 主題 | 狀態 |
| --- | --- | --- |
| `0001-use-nextjs-firebase.md` | 採用 Next.js 與 Firebase 作為主要平台 | Accepted |
| `0002-use-ddd-hexagonal.md` | 採用 DDD + Hexagonal Architecture | Accepted |
| `0003-use-firebase-auth-firestore-storage.md` | 採用 Firebase Auth / Firestore / Storage | Accepted |
| `0004-use-tailwind-shadcn-ui.md` | 採用 Tailwind CSS 與 shadcn/ui | Accepted |

## 何時需要 ADR
| 情境 | ADR? | 說明 |
| --- | --- | --- |
| 技術棧切換、長期平台選型 | Yes | 重大、耐久、難逆轉 |
| bounded context 重新切分 | Usually Yes | 會長期影響語言、依賴與資料模型 |
| rules / schema / page map 補充 | No | 直接更新 canonical doc |
| Mermaid 圖補強、命名規範、TODO 補註 | No | 不需要新增 ADR |
| 部署平台定案與 rollback 策略定案 | Maybe | 若會成為長期承諾則寫 ADR |

## 編輯順序
1. 先找對應 canonical doc。
2. 若 canonical doc 不足以承接，才評估新增 ADR。
3. 新 ADR 要回連更新 `docs/README.md` 與相關 canonical doc。
