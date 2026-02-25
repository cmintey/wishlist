<script lang="ts">
    import { page } from "$app/state";
    import { Steps, type StepsRootProps } from "@skeletonlabs/skeleton-svelte";
    import { steps } from "./steps";
    import { goto } from "$app/navigation";
    import { resolve } from "$app/paths";

    let step = $derived(Number.parseInt(page.params.step || "1") - 1);
    let Component = $derived(steps[step]);

    const onStepChange: StepsRootProps["onStepChange"] = (event) => {
        if (event.step !== steps.length) {
            goto(resolve("/setup-wizard/step-new/[step]", { step: (event.step + 1).toString() }));
        }
    };
</script>

<Steps count={steps.length} linear {onStepChange} {step}>
    <Steps.List>
        {#each { length: steps.length }, index}
            <Steps.Item {index}>
                <Steps.Indicator>{index + 1}</Steps.Indicator>
                {#if index < steps.length - 1}
                    <Steps.Separator />
                {/if}
            </Steps.Item>
        {/each}
    </Steps.List>

    <Steps.Content index={step}>
        <Steps.Context>
            {#snippet children(api)}
                <Component onSuccess={() => api().goToNextStep()} />
            {/snippet}
        </Steps.Context>
    </Steps.Content>
</Steps>
