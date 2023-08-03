package members

import (
	"context"
	"fmt"
	"strings"

	"cloud.google.com/go/bigquery"
	"google.golang.org/api/iterator"
)

func FetchMembers(ctx context.Context, client *bigquery.Client, ids map[string]bool) map[string]Member {
	// Convert the ids map to a slice
	var idList []string
	for id := range ids {
		idList = append(idList, fmt.Sprintf("'%s'", id))
	}

	// Perform the query
	query := client.Query(fmt.Sprintf("SELECT * FROM propfix.main.members WHERE id IN (%s)", strings.Join(idList, ",")))
	memberIterator, err := query.Read(ctx)
	if err != nil {
		return nil
	}

	// Process the members and store them in a map by ID
	memberMap := make(map[string]Member)
	for {
		var member Member

		err := memberIterator.Next(&member)
		if err == iterator.Done {
			break
		}
		if err != nil {
			return nil
		}

		memberMap[member.ID] = member
	}

	return memberMap
}
