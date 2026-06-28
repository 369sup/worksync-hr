# Page Map

## 目的
- 先定義主要頁面群組與責任。

## 圖解
```mermaid
flowchart TD
  Root[/]/ --> Dashboard[dashboard]
  Dashboard --> Emp[employees]
  Dashboard --> Att[attendance]
  Dashboard --> Lea[leave]
  Dashboard --> Pay[payroll]
  Dashboard --> Apr[approvals]
  Dashboard --> Aud[audit]
```

## 規則
- 頁面名稱與 bounded context 儘量對齊。
- 敏感頁面要先標示角色限制。

## 範例
- `payroll` 頁面預設只給 HR / Admin。

## 維護注意事項
- 路由調整時同步更新導覽與權限文件。
