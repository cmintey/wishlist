import type { Component } from "svelte";
import CreateAccountStep from "./CreateAccountStep.svelte";
import GlobalSettingsStep from "./GlobalSettingsStep.svelte";
import InviteUsersStep from "./InviteUsersStep.svelte";

export interface Props {
    onSuccess: () => void;
}
export const steps: Component<Props>[] = [CreateAccountStep, GlobalSettingsStep, InviteUsersStep];
