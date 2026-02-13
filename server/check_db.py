from app import app, db, User, Organization, ChatHistory

with app.app_context():
    users = User.query.all()
    print(f"Found {len(users)} users.")
    for user in users:
        print(f"User: {user.email} (ID: {user.id})")
        orgs = Organization.query.filter_by(user_id=user.id).all()
        print(f"  Organizations: {len(orgs)}")
        for org in orgs:
            history_count = ChatHistory.query.filter_by(organization_id=org.id).count()
            print(f"    Org: {org.name} (ID: {org.id}) - Messages: {history_count}")
            if history_count > 0:
                last_msg = ChatHistory.query.filter_by(organization_id=org.id).order_by(ChatHistory.timestamp.desc()).first()
                print(f"      Last message: {last_msg.query[:30]}...")
