import {
    ActionButton,
    Badge,
    Box,
    Callout,
    Divider,
    HStack,
    Switch,
    Text,
    VStack,
} from "@seed-design/react";
import { useState } from "react";
import { AppScreen } from "./AppScreen";

const TEXT_STYLES = ["t9Bold", "t7Bold", "t5Medium", "t4Regular", "t3Regular"] as const;

const SURFACES = [
    "bg.layerDefault",
    "bg.layerBasement",
    "bg.neutralWeak",
    "bg.brandSolid",
    "bg.criticalSolid",
    "bg.positiveSolid",
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <VStack paddingX="x4" paddingY="x5" gap="x3">
            <Text textStyle="t4Bold" color="fg.neutralMuted">
                {title}
            </Text>
            {children}
        </VStack>
    );
}

export function HomeScreen() {
    const [notify, setNotify] = useState(true);

    return (
        <AppScreen title="Cron Carrot" actions={<Badge tone="brand">preview</Badge>}>
            <Section title="Typography">
                <VStack gap="x2">
                    {TEXT_STYLES.map((textStyle) => (
                        <Text key={textStyle} textStyle={textStyle} color="fg.neutral">
                            {textStyle} · 당근 알림을 예약해요
                        </Text>
                    ))}
                </VStack>
            </Section>

            <Divider />

            <Section title="Color">
                <HStack gap="x2" flexWrap="wrap">
                    {SURFACES.map((token) => (
                        <VStack key={token} gap="x1" width="96px">
                            <Box
                                height="48px"
                                background={token}
                                borderRadius="r3"
                                borderWidth={1}
                                borderColor="stroke.neutralMuted"
                            />
                            <Text textStyle="t1Regular" color="fg.neutralSubtle">
                                {token.replace("bg.", "")}
                            </Text>
                        </VStack>
                    ))}
                </HStack>
            </Section>

            <Divider />

            <Section title="Action">
                <VStack gap="x2">
                    <ActionButton variant="brandSolid" size="large">
                        일정 만들기
                    </ActionButton>
                    <HStack gap="x2">
                        <ActionButton variant="neutralWeak" size="medium" flexGrow={1}>
                            나중에
                        </ActionButton>
                        <ActionButton variant="neutralOutline" size="medium" flexGrow={1}>
                            불러오기
                        </ActionButton>
                    </HStack>
                    <ActionButton variant="criticalSolid" size="small" style={{ alignSelf: "flex-start" }}>
                        삭제
                    </ActionButton>
                </VStack>
            </Section>

            <Divider />

            <Section title="Feedback">
                <VStack gap="x2">
                    <Callout.Root tone="informative">
                        <Callout.Content>
                            <Callout.Title>매일 오전 9시</Callout.Title>
                            <Callout.Description>
                                다음 실행까지 3시간 12분 남았어요.
                            </Callout.Description>
                        </Callout.Content>
                    </Callout.Root>
                    <Callout.Root tone="warning">
                        <Callout.Content>
                            <Callout.Description>
                                마지막 실행이 실패했어요. 로그를 확인해 주세요.
                            </Callout.Description>
                        </Callout.Content>
                    </Callout.Root>
                    <HStack gap="x1_5">
                        <Badge tone="positive">성공</Badge>
                        <Badge tone="warning">대기</Badge>
                        <Badge tone="critical">실패</Badge>
                        <Badge tone="neutral" variant="outline">
                            초안
                        </Badge>
                    </HStack>
                </VStack>
            </Section>

            <Divider />

            <Section title="Control">
                <Switch.Root checked={notify} onCheckedChange={setNotify}>
                    <Switch.HiddenInput />
                    <Switch.Label>실행 결과 알림 받기</Switch.Label>
                    <Switch.Control>
                        <Switch.Thumb />
                    </Switch.Control>
                </Switch.Root>
            </Section>
        </AppScreen>
    );
}
