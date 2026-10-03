# Security Specification: Gold Crochet Firestore ABAC

## 1. Data Invariants
- An order can only be created by an authenticated user matching `incoming().userId == request.auth.uid`.
- An order must have a valid total (>= 0), a list of items (<= 100), and an initial status of 'pendente'.
- A user document `/users/{userId}` can only be written by its owner (`request.auth.uid == userId`) or an admin.
- Only administrators can view orders across all users, update status to 'producao'/'enviado'/'entregue', or delete orders.
- Customers can only list and get their own orders (`resource.data.userId == request.auth.uid`).

## 2. The "Dirty Dozen" Payloads
1. Unauthenticated Order Creation: A client without auth token attempting to create a document in `/orders`. (Rejected: `request.auth != null` fails)
2. Identity Spoofing in Orders: User A attempting to create an order with `userId: "UserB"`. (Rejected: `incoming().userId == request.auth.uid` fails)
3. Negative Order Total: Creating an order with `total: -50`. (Rejected: `incoming().total >= 0` fails)
4. Unbounded Items Injection: Creating an order with 150 items. (Rejected: `incoming().items.size() <= 100` fails)
5. Unauthorized Status Escalation: Customer trying to create order with `status: 'entregue'`. (Rejected: restricted initial status)
6. State Shortcutting by Customer: Customer attempting to mark an order as 'entregue'. (Rejected: only admin can advance status)
7. Shadow Field Injection in Users: Adding `role: "admin"` during user self-registration without admin credentials. (Rejected: user can only self-assign 'customer')
8. Cross-User Profile Read: User A attempting `get` on `/users/UserB`. (Rejected: `isOwner(userId) || isAdmin()` fails)
9. Global Order Query Scraping: Non-admin calling `collection(db, 'orders')` without `where('userId', '==', auth.uid)`. (Rejected: list rule checks `resource.data.userId == request.auth.uid`)
10. Malformed Document ID Injection: Injecting a 2KB string as document ID. (Rejected: `isValidId()` fails)
11. Admin Document Self-Creation: Non-admin creating a document in `/admins/{userId}`. (Rejected: `isAdmin()` check fails)
12. Order Deletion by Customer: Authenticated customer attempting to delete an existing order. (Rejected: `isAdmin()` required)
