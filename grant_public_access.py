
import logging
from superset.app import create_app
from superset.security.manager import SupersetSecurityManager

# Create app context
app = create_app()
app.app_context().push()

# Get Security Manager
sm = app.appbuilder.sm

# Find Roles
public_role = sm.find_role("Public")
admin_role = sm.find_role("Admin")

if not public_role:
    print("Public role not found. Creating...")
    sm.add_role("Public")
    public_role = sm.find_role("Public")

if public_role and admin_role:
    print("Copying Admin permissions to Public role...")
    # Merge permissions
    public_role.permissions = list(set(public_role.permissions + admin_role.permissions))
    
    # helper to commit
    app.appbuilder.get_session.commit()
    print("SUCCESS: Public role is now effectively Admin. Login screen should be GONE.")
else:
    print("ERROR: Could not find Admin or Public role.")
    
