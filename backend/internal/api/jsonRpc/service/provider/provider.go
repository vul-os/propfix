package provider

type Name string

func (n Name) String() string {
	return string(n)
}

type Provider interface {
	Name() Name
}
