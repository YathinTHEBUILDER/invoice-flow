# InvoiceFlow Official Financial Model

This document outlines the official business logic and financial formulas for the InvoiceFlow platform.

## Core Formulas

| Component | Formula |
| :--- | :--- |
| **Discount Amount** | `Invoice Value × Discount Rate × (Tenure Days / 365)` |
| **Platform Fee** | `Invoice Value × 1%` |
| **MSME Receives** | `Invoice Value - Discount Amount - Platform Fee` |
| **Investor Deployment** | `Invoice Value - Discount Amount` |
| **Investor Return** | `Invoice Value` |
| **Investor Profit** | `Discount Amount` |

## Investor Share (Multiple Investors)
Every number scales by the investor's share percentage:
- **Share %** = `Investor Contribution / Total Invoice Value`
- **Each Deploys** = `(Invoice - Total Discount) × Share %`
- **Each Earns** = `Total Discount × Share %`
- **Each Receives** = `Invoice × Share %`

## Platform Revenue (GMV Scale)
| Monthly GMV | Platform Revenue (1%) | Annual Revenue |
| :--- | :--- | :--- |
| ₹1 Cr | ₹1,00,000 | ₹12,00,000 |
| ₹10 Cr | ₹10,00,000 | ₹1.2 Cr |
| ₹50 Cr | ₹50,00,000 | ₹6 Cr |
| ₹100 Cr | ₹1,00,00,000 | ₹12 Cr |

## Implementation Reference
The core logic is implemented in `src/lib/finance.ts`. All dashboard and marketplace components must use these shared utilities to ensure consistency.

---
*Location: Mysuru, Karnataka*
