import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ReactElement, useState } from "react";
import type { ClabernetesContainerlabDevTopologyV1Alpha1 } from "@/lib/clabernetes-client";
import type { Row } from "@tanstack/react-table";
import { CircleAlert, CircleCheck, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { getExpandCollapseIcon } from "@/components/topologies-table/table.tsx";

const kindPattern = /kind: (.*)/;
const imagePattern = /image: (.*)/;

function getTopologyReadyIcon(
  statusProbesEnabled: boolean | undefined,
  topologyReady: boolean | undefined,
): ReactElement {
  if (!statusProbesEnabled) {
    return (
      <div className="relative group">
        <CircleHelp className="h-4 w-4 mt-1 fill-yellow-500" />
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-800 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
          status probes not enabled
        </span>
      </div>
    );
  }

  switch (topologyReady) {
    case undefined:
      return (
        <div className="relative group">
          <CircleHelp className="h-4 w-4 mt-1 fill-yellow-500" />
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max bg-gray-800 text-white text-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            status probes enabled, but state unknown
          </span>
        </div>
      );
    case true:
      return <CircleCheck className="h-4 w-4 mt-1 fill-green-500" />;
    default:
      return <CircleAlert className="h-4 w-4 mt-1 fill-red-500" />;
  }
}

function getPorts(nodeName: string, ports: number[], expandedPorts: string[]): ReactElement {
  if (expandedPorts.includes(nodeName)) {
    return (
      <ul className="pl-24 list-disc">
        {ports.map((port, index) => (
          <li key={`${index}-${port}`}>{port}</li>
        ))}
      </ul>
    );
  }

  return <></>;
}

function getMatchOrUnknown(text: string, pattern: RegExp): string {
  const match = text.match(pattern);

  if (match === null) {
    return "unknown";
  }

  if (match.length !== 2) {
    return "unknown";
  }

  return match[1];
}

function getTopologyNodeCard(
  nodeName: string,
  obj: ClabernetesContainerlabDevTopologyV1Alpha1,
  expandedTcpPorts: string[],
  setExpandedTcpPorts: (expandedPorts: string[]) => void,
  expandedUdpPorts: string[],
  setExpandedUdpPorts: (expandedPorts: string[]) => void,
): ReactElement {
  const nodeConfig = obj.status?.configs[nodeName] ?? "";
  const nodeExposedPortData = obj.status?.exposedPorts[nodeName];

  const nodeReadiness = obj.status?.nodeReadiness[nodeName];
  const kind = getMatchOrUnknown(nodeConfig, kindPattern);
  const image = getMatchOrUnknown(nodeConfig, imagePattern);
  const loadBalancerAddress = nodeExposedPortData?.loadBalancerAddress;
  const exposedTcpPorts = nodeExposedPortData?.tcpPorts ?? [];
  const exposedUdpPorts = nodeExposedPortData?.udpPorts ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-center">{nodeName}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="flex flex-col text-sm font-normal">
          <div className="flex items-center">
            <span className="w-24 pr-2 text-right font-semibold">Readiness:</span>
            <span>{nodeReadiness}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 pr-2 text-right font-semibold">Kind:</span>
            <span>{kind}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 pr-2 text-right font-semibold">Image:</span>
            <span>{`${image}`}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 pr-2 text-right font-semibold">LB Address:</span>
            <span>{loadBalancerAddress}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 pr-2 text-right font-semibold">TCP Ports:</span>
            <Button
              onClick={(): void => {
                const clonedExpandedPorts = [...expandedTcpPorts];

                if (expandedTcpPorts.includes(nodeName)) {
                  setExpandedTcpPorts(
                    clonedExpandedPorts.filter((element) => {
                      return element !== nodeName;
                    }),
                  );
                  return;
                }

                clonedExpandedPorts.push(nodeName);
                setExpandedTcpPorts(clonedExpandedPorts);
              }}
              size="sm"
              variant="ghost"
            >
              {getExpandCollapseIcon(expandedTcpPorts.includes(nodeName))}
            </Button>
          </div>
          {getPorts(nodeName, exposedTcpPorts, expandedTcpPorts)}
          <div className="flex items-center">
            <span className="w-24 pr-2 text-right font-semibold">UDP Ports:</span>
            <Button
              onClick={(): void => {
                const clonedExpandedPorts = [...expandedUdpPorts];

                if (expandedUdpPorts.includes(nodeName)) {
                  setExpandedUdpPorts(
                    clonedExpandedPorts.filter((element) => {
                      return element !== nodeName;
                    }),
                  );
                  return;
                }

                clonedExpandedPorts.push(nodeName);
                setExpandedUdpPorts(clonedExpandedPorts);
              }}
              size="sm"
              variant="ghost"
            >
              {getExpandCollapseIcon(expandedUdpPorts.includes(nodeName))}
            </Button>
          </div>
          {getPorts(nodeName, exposedUdpPorts, expandedUdpPorts)}
        </div>
      </CardContent>
    </Card>
  );
}

interface ExpandProps {
  readonly row: Row<ClabernetesContainerlabDevTopologyV1Alpha1>;
}

export function Expand(props: ExpandProps): ReactElement {
  const { row } = props;

  const obj = row.original;
  const objNodes = obj.status?.configs ? Array.from(Object.keys(obj.status?.configs)) : [];

  const [expandedTcpPorts, setExpandedTcpPorts] = useState<string[]>([]);

  const [expandedUdpPorts, setExpandedUdpPorts] = useState<string[]>([]);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <div className="flex flex-col text-sm font-normal">
              <div className="flex items-center">
                <span className="w-24 pr-2 text-right font-semibold">Namespace:</span>
                <span>{obj.metadata?.namespace as string}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 pr-2 text-right font-semibold">Name:</span>
                <span>{obj.metadata?.name as string}</span>
              </div>
              <div className="flex items-center">
                <span className="w-24 pr-2 text-right font-semibold">Ready:</span>
                <span>
                  {getTopologyReadyIcon(obj.spec?.statusProbes?.enabled, obj.status?.topologyReady)}
                </span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {objNodes.map((nodeName) => {
            return getTopologyNodeCard(
              nodeName,
              obj,
              expandedTcpPorts,
              setExpandedTcpPorts,
              expandedUdpPorts,
              setExpandedUdpPorts,
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
