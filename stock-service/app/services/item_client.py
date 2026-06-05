from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from fastapi import HTTPException

from app.core.config import get_settings


def ensure_item_exists(item_id: int, authorization: str) -> None:
    request = Request(f"{get_settings().item_service_url}/items/{item_id}", method="GET")
    if authorization:
        request.add_header("Authorization", authorization)
    try:
        with urlopen(request, timeout=3) as response:
            if response.status != 200:
                raise HTTPException(status_code=400, detail="item does not exist")
    except HTTPError as exc:
        if exc.code in (401, 403):
            raise HTTPException(status_code=exc.code, detail="item service rejected token") from exc
        if exc.code == 404:
            raise HTTPException(status_code=400, detail="item does not exist") from exc
        raise HTTPException(status_code=502, detail="item service error") from exc
    except URLError as exc:
        raise HTTPException(status_code=502, detail="item service unavailable") from exc
