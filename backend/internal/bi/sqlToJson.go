package bi

import (
	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
	"reflect"
)

func SchemeToColumnsTypes(scheme bigquery.Schema) ([]string, []reflect.Type) {
	var types []reflect.Type
	var columns []string

	for _, schemeItem := range scheme {
		types = append(types, BqStringTypeToGoType(string(schemeItem.Type)))
		columns = append(columns, schemeItem.Name)
	}
	return columns, types
}

func BqSQLToJSON(it *bigquery.RowIterator) (map[string]interface{}, []string, error) {
    columns, _ := SchemeToColumnsTypes(it.Schema)
    data := make(map[string]interface{})
    
    for {
        var bqValues []bigquery.Value
        err := it.Next(&bqValues)
        if err == iterator.Done {
            break
        }
        if err != nil {
            return nil, nil, err
        }
        
        for i, v := range bqValues {
            if len(columns) > i {
                column := columns[i]
                if _, exists := data[column]; !exists {
                    data[column] = make([]interface{}, 0)
                }
                data[column] = append(data[column].([]interface{}), v)
            }
        }
    }
    
    return data, columns, nil
}
