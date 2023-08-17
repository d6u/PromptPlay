import inspect
from typing import cast, get_args

from .types import Info


def ensure_db_user(func):
    sig = inspect.signature(func)

    if not any(
        issubclass(t, type(None)) for t in get_args(sig.return_annotation)
    ):
        raise Exception(
            f'Return type of function "{func.__name__}" must be optional.'
        )

    is_found_info = False
    info_arg_name: str | None = None
    for name, param in sig.parameters.items():
        if param.annotation == Info:
            is_found_info = True
            info_arg_name = name
            break

    if not is_found_info:
        raise Exception("Cannot find an argument with type `Info`.")

    def wrapper(*args, **kwargs):
        info = cast(Info, kwargs[info_arg_name])

        if info.context.db_user == None:
            print("The access is not authorized.")
            return None

        result = func(db_user=info.context.db_user, *args, **kwargs)

        return result

    new_params = dict(sig.parameters)
    del new_params["db_user"]

    wrapper.__name__ = func.__name__
    wrapper.__signature__ = sig.replace(parameters=new_params.values())

    return wrapper
