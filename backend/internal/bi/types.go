package bi

import (
	"cloud.google.com/go/bigquery"
	"reflect"
)

func BqStringTypeToGoType(stringType string) reflect.Type {
	switch bigquery.FieldType(stringType) {
		case bigquery.StringFieldType:
			return reflect.TypeOf("")
		case bigquery.BytesFieldType:
			return reflect.TypeOf(uint8(1))
		case bigquery.IntegerFieldType:
			return reflect.TypeOf((int32)(0))
		case bigquery.FloatFieldType:
			return reflect.TypeOf((float32)(0.0))
		case bigquery.BooleanFieldType:
			return reflect.TypeOf(false)
		case bigquery.TimestampFieldType:
			return reflect.TypeOf("")
		case bigquery.RecordFieldType:
			// todo: what is this?
			return reflect.TypeOf("")
		case bigquery.DateFieldType:
			return reflect.TypeOf("")
		case bigquery.TimeFieldType:
			return reflect.TypeOf("")
		case bigquery.DateTimeFieldType:
			return reflect.TypeOf("")
		case bigquery.NumericFieldType:
			return reflect.TypeOf("")
		case bigquery.GeographyFieldType:
			return reflect.TypeOf("")
		case bigquery.BigNumericFieldType:
			return reflect.TypeOf("")
		default:
			return reflect.TypeOf("")
	}
}