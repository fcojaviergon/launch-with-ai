from unittest.mock import MagicMock, patch, call

from sqlmodel import select

from app.tests_pre_start import init, logger


def test_init_successful_connection() -> None:
    engine_mock = MagicMock()

    # Create a proper mock for the session context manager
    session_mock = MagicMock()
    session_instance = MagicMock()
    session_mock.return_value.__enter__ = MagicMock(return_value=session_instance)
    session_mock.return_value.__exit__ = MagicMock(return_value=None)

    with (
        patch("app.tests_pre_start.Session", session_mock),
        patch.object(logger, "info"),
        patch.object(logger, "error"),
        patch.object(logger, "warn"),
    ):
        try:
            init(engine_mock)
            connection_successful = True
        except Exception:
            connection_successful = False

        assert (
            connection_successful
        ), "The database connection should be successful and not raise an exception."

        # Verify Session was called with the engine
        session_mock.assert_called_once_with(engine_mock)

        # Verify exec was called on the session instance
        assert session_instance.exec.called, "session.exec should have been called"
