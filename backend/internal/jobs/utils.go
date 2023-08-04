package jobs

import (
	"reflect"
)

type Change struct {
	Field string      // Field name that was changed
	Data  interface{} // New data for the field
}

func CompareJobs(existing Job, updated Job) []Change {
	var changes []Change
	valExisting := reflect.ValueOf(existing)
	valUpdated := reflect.ValueOf(updated)
	typeOfExisting := valExisting.Type()

	for i := 0; i < valExisting.NumField(); i++ {
		field := typeOfExisting.Field(i)
		existingValue := valExisting.Field(i)
		updatedValue := valUpdated.Field(i)

		if !reflect.DeepEqual(existingValue.Interface(), updatedValue.Interface()) {
			changes = append(changes, Change{Field: field.Name, Data: updatedValue.Interface()})
		}
	}

	return changes
}
