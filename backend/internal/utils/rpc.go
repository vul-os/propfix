package utils

type EmptyRequest struct{}

type EmptyResponse struct{}

// NewBadRequestError creates a new BadRequestError with the given error message.
func NewBadRequestError(message string) error {
	return BadRequestError{Message: message}
}

// BadRequestError represents a bad request error with a custom message.
type BadRequestError struct {
	Message string
}

// Error returns the error message of the BadRequestError.
func (e BadRequestError) Error() string {
	return e.Message
}
