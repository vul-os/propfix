package utils

// ContainsString checks if a string exists in a slice of strings.
func ContainsString(slice []string, value string) bool {
	for _, item := range slice {
		if item == value {
			return true
		}
	}
	return false
}

// RemoveString removes the specified string from the slice.
func RemoveString(slice []string, element string) []string {
	index := -1
	for i, v := range slice {
		if v == element {
			index = i
			break
		}
	}
	if index == -1 {
		return slice
	}
	return append(slice[:index], slice[index+1:]...)
}
