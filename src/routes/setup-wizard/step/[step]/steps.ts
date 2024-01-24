import CreateAccountStep from "./CreateAccountStep.svelte";
import DefaultGroupSettingsStep from "./DefaultGroupSettingsStep.svelte";
import GlobalSettingsStep from "./GlobalSettingsStep.svelte";
import InviteUsersStep from "./InviteUsersStep.svelte";

export const steps: ConstructorOfATypedSvelteComponent[] = [
    CreateAccountStep,
    GlobalSettingsStep,
    DefaultGroupSettingsStep,
    InviteUsersStep
];
