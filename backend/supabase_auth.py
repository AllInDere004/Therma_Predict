"""Verify Supabase user access tokens using the project's public signing keys."""

from functools import lru_cache, wraps

import jwt
from flask import current_app, g, jsonify, request
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientConnectionError, PyJWTError


ALLOWED_ALGORITHMS = ("ES256", "RS256")
AUDIENCE = "authenticated"


@lru_cache(maxsize=4)
def jwks_client(issuer):
    return PyJWKClient(f"{issuer}/.well-known/jwks.json", lifespan=300, timeout=5)


def verify_supabase_token(token, issuer):
    header = jwt.get_unverified_header(token)
    algorithm = header.get("alg")
    kid = header.get("kid")
    if algorithm not in ALLOWED_ALGORITHMS or not isinstance(kid, str) or not kid:
        raise InvalidTokenError("Unsupported signing key")

    signing_key = jwks_client(issuer).get_signing_key(kid)
    if signing_key.algorithm_name != algorithm:
        raise InvalidTokenError("Signing key algorithm mismatch")

    claims = jwt.decode(
        token,
        signing_key,
        algorithms=ALLOWED_ALGORITHMS,
        issuer=issuer,
        audience=AUDIENCE,
        options={"require": ["iss", "aud", "exp", "sub"]},
    )
    if not claims["sub"] or claims.get("role") != AUDIENCE or claims.get("is_anonymous") is True:
        raise InvalidTokenError("Expected a Supabase user session")
    return claims


def require_supabase_auth(handler):
    @wraps(handler)
    def authenticated(*args, **kwargs):
        fields = request.headers.get("Authorization", "").split()
        if len(fields) != 2 or fields[0].lower() != "bearer" or len(fields[1]) > 8192:
            return jsonify(error="Bearer token required"), 401, {"WWW-Authenticate": "Bearer"}

        project_url = current_app.config.get("SUPABASE_URL", "").strip().rstrip("/")
        if not project_url:
            return jsonify(error="Authentication service unavailable"), 503

        try:
            g.auth_user = verify_supabase_token(fields[1], f"{project_url}/auth/v1")
        except PyJWKClientConnectionError:
            return jsonify(error="Authentication service unavailable"), 503
        except (PyJWTError, TypeError, ValueError):
            return jsonify(error="Invalid or expired access token"), 401, {
                "WWW-Authenticate": 'Bearer error="invalid_token"',
            }

        return handler(*args, **kwargs)

    return authenticated
