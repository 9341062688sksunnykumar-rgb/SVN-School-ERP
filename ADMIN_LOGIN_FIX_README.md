# SVN ERP — Admin Login fix

This patch automatically creates the missing `users` table when the API server starts and creates an Admin account **only if the user ID does not already exist**. Existing users are not overwritten.

## One-time Render configuration

In Render > SVN-School-ERP **Web Service** > Environment, ensure `DATABASE_URL` points to your Render Postgres database (use Render's database connection feature, not a password pasted in chat).

Add these secret environment variables:
- `ADMIN_USER_ID`: the ID you want to use to log in
- `ADMIN_PASSWORD`: a new strong password of **at least 12 characters**
- `ADMIN_NAME` (optional): displayed administrator name

Save and redeploy the **Web Service** from the updated GitHub repository. Login using the ID and password you set. Do not commit passwords or the `.env` file to GitHub.

If that user ID already exists, this patch deliberately leaves its existing password unchanged. To create a fresh Admin, use a different `ADMIN_USER_ID`.

This patch addresses missing Admin users / missing `users` table. It does not guarantee other ERP database tables exist; those may require a separate schema migration.
