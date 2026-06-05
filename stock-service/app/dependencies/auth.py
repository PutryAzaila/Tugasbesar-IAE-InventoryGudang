from typing import Annotated

import jwt
from fastapi import Depends, Header, HTTPException

from app.core.config import get_settings


def require_roles(*allowed_roles: str):
    def dependency(authorization: Annotated[str | None, Header()] = None) -> dict:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="missing bearer token")
        try:
            claims = jwt.decode(
                authorization[7:],
                get_settings().jwt_secret,
                algorithms=["HS256"],
            )
        except jwt.PyJWTError as exc:
            raise HTTPException(status_code=401, detail="invalid token") from exc
        if claims.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="role is not allowed")
        return claims

    return dependency


def bearer_token(authorization: Annotated[str | None, Header()] = None) -> str:
    return authorization or ""
