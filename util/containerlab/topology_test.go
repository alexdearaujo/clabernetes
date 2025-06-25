package containerlab_test

import (
	"testing"

	"github.com/google/go-cmp/cmp"

	"gopkg.in/yaml.v3"

	clab "github.com/srl-labs/clabernetes/util/containerlab"
)

func TestLoadContainerlabConfigFromString(t *testing.T) {
	cases := []struct {
		config string
	}{
		{
			config: `
name: topo01

topology:
  nodes:
    srl1:
      kind: srl
      image: ghcr.io/nokia/srlinux
      healthcheck:
        test:
          - CMD-SHELL
          - cat /etc/os-release
`,
		},
		{
			config: `
name: topo02

topology:
  nodes:
    srl2:
      kind: srl
      image: ghcr.io/nokia/srlinux
      healthcheck:
        test:
          - CMD-SHELL
          - cat /etc/os-release
        start-period: 3
        retries: 1
        interval: 5
        timeout: 2		
`,
		},
	}

	for _, testCase := range cases {
		_, err := clab.LoadContainerlabConfig(testCase.config)
		if err != nil {
			t.Errorf("Unable to load containerlab config: %s", err)
		}
	}
}

func TestLoadContainerlabConfigFromConfigObjects(t *testing.T) {
	cases := []struct {
		config *clab.Config
	}{
		{
			config: getMinimalValidConfigObject(),
		},
		{
			config: getMinimalValidConfigObjectWithFullHealthcheck(),
		},
	}

	for _, testCase := range cases {
		marshaled, err := yaml.Marshal(testCase.config)
		if err != nil {
			t.Fatalf("Marshal error: %v", err)
		}

		cfg, err := clab.LoadContainerlabConfig(string(marshaled))
		if err != nil {
			t.Errorf("Unable to load containerlab config: %s", err)
		}

		if diff := cmp.Diff(testCase.config.Topology, cfg.Topology); diff != "" {
			t.Errorf("Configs not equal (-got +want):\n%s", diff)
		}
	}

}

func getMinimalValidConfigObjectWithFullHealthcheck() *clab.Config {
	config := &clab.Config{Name: "minimalValidConfig"}
	config.Topology = &clab.Topology{
		Defaults: &clab.NodeDefinition{Ports: []string{}},
		Nodes:    make(map[string]*clab.NodeDefinition)}
	node := &clab.NodeDefinition{
		Ports: []string{},
		Kind:  "srl",
		Image: "ghcr.io/nokia/srlinux",
		Healthcheck: &clab.HealthcheckConfig{
			Test:        []string{"CMD-SHELL", "cat /etc/os-release"},
			StartPeriod: 5,
			Retries:     2,
			Interval:    1,
			Timeout:     3,
		},
	}
	config.Topology.Nodes["srl1"] = node
	return config
}

func getMinimalValidConfigObject() *clab.Config {
	config := &clab.Config{Name: "minimalValidConfigWithFullHealthCheck"}
	config.Topology = &clab.Topology{
		Defaults: &clab.NodeDefinition{Ports: []string{}},
		Nodes:    make(map[string]*clab.NodeDefinition)}
	node := &clab.NodeDefinition{
		Ports: []string{},
		Kind:  "srl",
		Image: "ghcr.io/nokia/srlinux",
		Healthcheck: &clab.HealthcheckConfig{
			Test: []string{"CMD-SHELL", "cat /etc/os-release"},
		},
	}
	config.Topology.Nodes["srl1"] = node
	return config
}
