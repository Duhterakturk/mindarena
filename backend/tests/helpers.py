def register_user(client, email="user@example.com", password="Test1234", full_name="Test User", role="student", **extra):
    payload = {"email": email, "password": password, "full_name": full_name, "role": role, **extra}
    return client.post("/api/auth/register", json=payload)


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}
